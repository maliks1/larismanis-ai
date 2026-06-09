import React, { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
}

interface TaxEstimationProps {
  userId: string;
}

const TaxEstimation: React.FC<TaxEstimationProps> = ({ userId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [estimatedTax, setEstimatedTax] = useState<number>(0);
  const [complianceStatus, setComplianceStatus] = useState<string>('');

  const calculateTax = (transactions: Transaction[]) => {
    // Simple tax calculation logic (replace with actual tax rules)
    const totalIncome = transactions.reduce((sum, transaction) => {
      if (transaction.type === 'income') {
        return sum + transaction.amount;
      }
      return sum;
    }, 0);

    const taxRate = 0.1; // 10% tax rate (example)
    const estimatedTax = totalIncome * taxRate;
    setEstimatedTax(estimatedTax);

    // Simple compliance check (replace with actual compliance rules)
    if (estimatedTax > 0) {
      setComplianceStatus('Tax needs to be paid');
    } else {
      setComplianceStatus('No tax to pay');
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        setTransactions(data || []);
        calculateTax(data || []);
      }
    };

    fetchTransactions();
  }, [userId]);

  return (
    <div className="tax-estimation">
      <h2>Pajak Estimasi & Kompliance</h2>
      <div className="tax-summary">
        <p>Estimated Tax: {estimatedTax.toFixed(2)}</p>
        <p>Compliance Status: {complianceStatus}</p>
      </div>
      <div className="transaction-list">
        <h3>Transactions</h3>
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              {transaction.date}: {transaction.description} - {transaction.amount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaxEstimation;
