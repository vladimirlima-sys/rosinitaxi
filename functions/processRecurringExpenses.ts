import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get current date
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get all recurring expenses
    const allExpenses = await base44.asServiceRole.entities.Expense.list();
    const recurringExpenses = allExpenses.filter(e => e.is_recurring && e.recurring_start_month);

    // Filter expenses that haven't been added for current month yet
    const expensesToAdd = recurringExpenses.filter(expense => {
      const existsInMonth = allExpenses.some(
        e => e.month === currentMonth && 
            e.category === expense.category && 
            e.amount === expense.amount &&
            e.is_recurring === false
      );
      return !existsInMonth;
    });

    // Create new expenses for current month
    for (const expense of expensesToAdd) {
      await base44.asServiceRole.entities.Expense.create({
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        date: `${currentMonth}-05`,
        month: currentMonth,
        is_recurring: false
      });
    }

    return Response.json({ 
      success: true, 
      processed: expensesToAdd.length,
      currentMonth
    });
  } catch (error) {
    console.error('Error processing recurring expenses:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});