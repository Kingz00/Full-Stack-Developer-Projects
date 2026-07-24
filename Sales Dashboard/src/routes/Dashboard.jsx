import React from "react";
import supabase from "../supabase-client";
import { Chart } from 'react-charts';
import Form from "../components/Form";

function Dashboard() {

    // Run the commands below in Supabase SQL editor to allow postgreSQL aggregates:
    // 	 ALTER ROLE authenticator SET pgrst.db_aggregates_enabled = 'true';
    //   NOTIFY pgrst, 'reload config';

    const [metrics, setMetrics] = React.useState([])

    const fetchMetrics = async () => {

        try {

            const { data, error } = await supabase
                .from('sales_deals')
                .select(
                    `
                    name,
                    total_sales:value.sum()
                    `,
                )

            if (error) {
                throw new Error(`${error.message}`)
            }
            setMetrics(data)
        } catch (err) {
            console.log(`Error fetching sales data: ${err}`)
        }

    }

    React.useEffect(() => {
        fetchMetrics()

        const channel = supabase
            .channel('deal-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'sales_deals'
                },
                (payload) => {
                    // Action
                    console.log(payload)
                    fetchMetrics()
                })
            .subscribe();

        // Clean up subscription
        return () => {
            supabase.removeChannel(channel);
        };
    }, [])

    const chartData = [
        {
            data: metrics.map((m) => ({
                primary: m.name,
                secondary: m.total_sales,
            })),
        },
    ];

    const primaryAxis = {
        getValue: (d) => d.primary,
        scaleType: 'band',
        padding: 0.2,
        position: 'bottom',
    };

    const secondaryAxes = [
        {
            getValue: (d) => d.secondary,
            scaleType: 'linear',
            min: 0,
            max: y_max(),
            padding: {
                top: 20,
                bottom: 40,
            },
        },
    ];

    function y_max() {
        if (metrics.length > 0) {
            const maxSum = Math.max(...metrics.map((m) => m.sum));
            return maxSum + 2000;
        }
        return 5000;
    }


    return (
        <div className="dashboard-wrapper">
            <div className="chart-container">
                <h2>Total Sales This Quarter ($)</h2>
                <div style={{ flex: 1 }}>
                    <Chart
                        options={{
                            data: chartData,
                            primaryAxis,
                            secondaryAxes,
                            type: 'bar',
                            defaultColors: ['#58d675'],
                            tooltip: {
                                show: false,
                            },
                        }}
                    />
                </div>
                <Form metrics={metrics} />
            </div>
        </div>
    );
}

export default Dashboard;