import React from 'react';
import Card from '../ui/Card';

const StatCard = ({ title, value, icon, color }) => {
    return (
        <Card>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className={`p-3 rounded-full`} style={{ backgroundColor: color, color: 'white' }}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

export default StatCard;
