import React from 'react';
import Expense from '../components/finance/Expense';

const ExpensePage: React.FC<any> = (props) => {
    return <Expense {...props} />;
};

export default ExpensePage;