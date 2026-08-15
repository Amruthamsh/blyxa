import pg from "npm:pg@8.12.0";
const { Pool } = pg;
const SUPABASE_DB_URL = Deno.env.get("SUPABASE_DB_URL");
if (!SUPABASE_DB_URL) {
  throw new Error("SUPABASE_DB_URL is required");
}
const pool = new Pool({
  connectionString: SUPABASE_DB_URL
});
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
Deno.serve(async (req)=>{
  // Only POST is allowed
  if (req.method !== "POST") {
    return jsonResponse({
      error: "Method not allowed"
    }, 405);
  }
  let body;
  try {
    body = await req.json();
  } catch  {
    return jsonResponse({
      error: "Invalid JSON body"
    }, 400);
  }
  const { customer_name, phone, email, address, notes, items } = body ?? {};
  // -----------------------------
  // Validate customer information
  // -----------------------------
  if (typeof customer_name !== "string" || customer_name.trim() === "") {
    return jsonResponse({
      error: "customer_name is required"
    }, 400);
  }
  if (typeof phone !== "string" || phone.trim() === "") {
    return jsonResponse({
      error: "phone is required"
    }, 400);
  }
  if (email !== undefined && email !== null && typeof email !== "string") {
    return jsonResponse({
      error: "Invalid email"
    }, 400);
  }
  if (address !== undefined && address !== null && typeof address !== "string") {
    return jsonResponse({
      error: "Invalid address"
    }, 400);
  }
  if (notes !== undefined && notes !== null && typeof notes !== "string") {
    return jsonResponse({
      error: "Invalid notes"
    }, 400);
  }
  // -----------------------------
  // Validate items
  // -----------------------------
  if (!Array.isArray(items) || items.length === 0) {
    return jsonResponse({
      error: "items must be a non-empty array"
    }, 400);
  }
  if (items.length > 50) {
    return jsonResponse({
      error: "Too many items in order"
    }, 400);
  }
  const normalizedItems = [];
  for(let i = 0; i < items.length; i++){
    const item = items[i];
    if (!item || typeof item !== "object") {
      return jsonResponse({
        error: `Item ${i} is invalid`
      }, 400);
    }
    const { product_id, quantity } = item;
    if (typeof product_id !== "string" || product_id.trim() === "") {
      return jsonResponse({
        error: `Item ${i}: product_id is required`
      }, 400);
    }
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return jsonResponse({
        error: `Item ${i}: quantity must be a positive integer`
      }, 400);
    }
    if (parsedQuantity > 100) {
      return jsonResponse({
        error: `Item ${i}: quantity cannot exceed 100`
      }, 400);
    }
    normalizedItems.push({
      product_id,
      quantity: parsedQuantity
    });
  }
  // -----------------------------
  // Connect to database
  // -----------------------------
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // ---------------------------------------------
    // Fetch products and lock rows for this order
    // ---------------------------------------------
    const productIds = normalizedItems.map((item)=>item.product_id);
    const productsResult = await client.query(`
      SELECT
        id,
        name,
        price,
        stock,
        is_active
      FROM public.products
      WHERE id = ANY($1::uuid[])
      FOR UPDATE;
      `, [
      productIds
    ]);
    const products = productsResult.rows;
    // Make lookup map
    const productMap = new Map();
    for (const product of products){
      productMap.set(product.id, product);
    }
    // ---------------------------------------------
    // Validate products and calculate total
    // ---------------------------------------------
    let totalAmount = 0;
    const orderItems = [];
    for (const item of normalizedItems){
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      if (!product.is_active) {
        throw new Error(`Product "${product.name}" is no longer available`);
      }
      const stock = Number(product.stock);
      const price = Number(product.price);
      if (stock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}"`);
      }
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;
      orderItems.push({
        product_id: product.id,
        name: product.name,
        quantity: item.quantity,
        unit_price: price
      });
    }
    // ---------------------------------------------
    // Create order
    // ---------------------------------------------
    const orderResult = await client.query(`
      INSERT INTO public.orders (
        customer_name,
        phone,
        email,
        address,
        notes,
        status,
        total_amount
      )
      VALUES ($1, $2, $3, $4, $5, 'new', $6)
      RETURNING *;
      `, [
      customer_name.trim(),
      phone.trim(),
      email?.trim() || null,
      address?.trim() || null,
      notes?.trim() || null,
      totalAmount
    ]);
    const order = orderResult.rows[0];
    // ---------------------------------------------
    // Insert order items + decrement stock
    // ---------------------------------------------
    const createdItems = [];
    for (const item of orderItems){
      const itemResult = await client.query(`
        INSERT INTO public.order_items (
          order_id,
          product_id,
          quantity,
          unit_price
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `, [
        order.id,
        item.product_id,
        item.quantity,
        item.unit_price
      ]);
      createdItems.push({
        ...itemResult.rows[0],
        product_name: item.name
      });
      // Decrement stock
      await client.query(`
        UPDATE public.products
        SET
          stock = stock - $1,
          updated_at = now()
        WHERE id = $2;
        `, [
        item.quantity,
        item.product_id
      ]);
    }
    // ---------------------------------------------
    // Commit transaction
    // ---------------------------------------------
    await client.query("COMMIT");
    // ---------------------------------------------
    // Return result
    // ---------------------------------------------
    return jsonResponse({
      success: true,
      order,
      items: createdItems
    }, 201);
  } catch (error) {
    // Rollback everything if anything fails
    try {
      await client.query("ROLLBACK");
    } catch  {
    // Ignore rollback errors
    }
    console.error("Create order error:", error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order"
    }, 400);
  } finally{
    client.release();
  }
});
