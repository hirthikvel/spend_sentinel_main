import * as fs from 'fs';
import * as path from 'path';

const headers = [
  'usage_date', 'service', 'region', 'cost', 
  'resource_id', 'usage_type', 'usage_quantity', 
  'account_id', 'tag_env', 'tag_team'
].join(',');

const rows = [
  '2026-10-01,Amazon EC2,us-east-1,38.12,i-web-01,BoxUsage:m5.xlarge,24,123456789012,prod,platform',
  '2026-10-01,Amazon RDS,us-east-1,120.00,rds-main,InstanceUsage:db.r5.2xlarge,24,123456789012,prod,data',
  '2026-10-02,Amazon EC2,us-west-2,14.50,i-dev-build-01,BoxUsage:c5.xlarge,24,123456789012,dev,platform'
];

const csvContent = [headers, ...rows].join('\n');
const filePath = path.join(process.cwd(), 'sample-bill.csv');

fs.writeFileSync(filePath, csvContent);
console.log(`Sample CSV generated at: ${filePath}`);
