import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { table_number, items, total_amount } = body;

    if (!table_number || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order: missing table, items, or empty order' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(total_amount) || total_amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid total amount' },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.id || !item.name || !Number.isFinite(item.price) || !Number.isFinite(item.qty) || item.qty < 1) {
        return NextResponse.json(
          { error: `Invalid item: ${item.name || 'unknown'}` },
          { status: 400 }
        );
      }
      if (item.price < 0) {
        return NextResponse.json(
          { error: `Negative price not allowed: ${item.name}` },
          { status: 400 }
        );
      }
    }

    const serverTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (Math.abs(serverTotal - total_amount) > 0.01) {
      return NextResponse.json(
        { error: 'Total amount mismatch' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('active_orders')
      .insert([{
        table_number,
        items,
        total_amount,
        status: 'PENDING',
      }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
