import React, {useEffect, useState} from 'react';
import './App.css';
import data from "./data";
import 'antd/dist/antd.css';
import {Table,Tag} from 'antd';
import {DollarOutlined,CalendarOutlined} from '@ant-design/icons';


function calculateResults(incomingData) {     // Calculate points per transaction

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const pointsPerTransaction = incomingData.map(transaction => {
        let points = 0;
        let over100 = transaction.amount - 100;

        if (over100 > 0) {

            points += (over100 * 2); // A customer receives 2 points for every dollar spent over $100 in each transaction
        }
        if (transaction.amount > 50) {

            points += 50;  // plus 1 point for every dollar spent over $50 in each transaction
        }
        const month = new Date(transaction.transactionDate).getMonth();
        return {...transaction, points, month};
    });

    let customer = {};
    let totalPointsByCustomer = {};
    pointsPerTransaction.map(pointsPerTransaction => {
        let {customerId, name, month, points} = pointsPerTransaction;
        if (!customer[customerId]) {
            customer[customerId] = [];
        }
        if (!totalPointsByCustomer[customerId]) {
            totalPointsByCustomer[name] = 0;
        }
        totalPointsByCustomer[name] += points;
        if (customer[customerId][month]) {
            customer[customerId][month].points += points;
            customer[customerId][month].monthNumber = month;
            customer[customerId][month].numTransactions++;
        } else {

            customer[customerId][month] = {
                customerId,
                name,
                monthNumber: month,
                month: months[month],
                numTransactions: 1,
                points
            }
        }
        return pointsPerTransaction
    });
    let summaryByCustomer = [];
    let customerKey="";
    for (customerKey in customer) {
        customer[customerKey].map(cRow => {
            return summaryByCustomer.push(cRow);
        });
    }
    let totalByCustomer = [];
    for (customerKey in totalPointsByCustomer) {
        totalByCustomer.push({
            name: customerKey,
            points: totalPointsByCustomer[customerKey]
        });
    }
    return {
        summaryByCustomer,
        pointsPerTransaction,
        totalPointsByCustomer: totalByCustomer
    };
}

function App() {
    const [transactionData, setTransactionData] = useState(null);

    const columns = [
        {
            title: 'Customer',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Month',
            dataIndex: 'month',
            key: 'month',
        },
        {
            title: '# of Transactions',
            dataIndex: 'numTransactions',
            key: 'numTransactions',
        },
        {
            title: 'Reward Points',
            dataIndex: 'points',
            key: 'points',
        },
        {
            title: 'Transaction info',
            render: (record) =>
                getSpecificTransactions(record).map((transaction, i) => {
                    return <div style={{marginBottom:'3px'}} key={i}>

                                <CalendarOutlined /> {transaction.transactionDate} <DollarOutlined /> {transaction.amount} <Tag className="points-tag" color="green">Point:{transaction.points}</Tag>

                    </div>
                })
        },

    ];

    const totalColumns = [
        {
            title: 'Customer',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Points',
            dataIndex: 'points',
            key: 'points',
        },
    ]

    function getSpecificTransactions(row) { // Fetch transaction details
        let customerByMonth = transactionData.pointsPerTransaction.filter((tRow) => {
            return row.customerId === tRow.customerId && row.monthNumber === tRow.month;
        });
        return customerByMonth;
    }

    useEffect(() => {
        const results = calculateResults(data);
        setTransactionData(results);
    }, []);

    return (transactionData == null ?
            <div>Loading...</div>
            :
            <div>
                <div className="container">
                    <div className="row">
                        <div className="col-8">
                            <h2>Rewards Points System by Customer and Months</h2>
                            <Table pagination={false} columns={columns} dataSource={transactionData.summaryByCustomer}/>
                        </div>
                        <br clear="all"/>
                        <div className="col-8">
                            <h2>Total Rewards Points System By Customer</h2>
                            <Table pagination={false} columns={totalColumns}
                                   dataSource={transactionData.totalPointsByCustomer}/>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default App;
