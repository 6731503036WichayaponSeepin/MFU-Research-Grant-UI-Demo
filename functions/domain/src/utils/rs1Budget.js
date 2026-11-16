export const BUDGET_CATEGORIES=['compensation','directCost','materials','utility']
export const BUDGET_DETAIL_KEYS={compensation:'compensationDetail',directCost:'directDetail',materials:'materialsDetail',utility:'utilityDetail'}
export function budgetRows(data={},category){
 if(Array.isArray(data.budgetItems?.[category]))return data.budgetItems[category]
 const rows=[1,2,3].map(n=>({description:data[category+'Item'+n]??'',amount:data[category+'Amount'+n]??''}))
 if(rows.some(row=>String(row.description).trim()||String(row.amount).trim()))return rows
 const description=data[BUDGET_DETAIL_KEYS[category]]??'',amount=data[category]??''
 return String(description).trim()||String(amount).trim()? [{description,amount}]:[]
}
export function budgetSubtotal(rows){return rows.reduce((sum,row)=>sum+(Number.isFinite(Number(row.amount))?Number(row.amount):0),0)}
export function budgetPatch(data,category,rows){
 const budgetItems={...data.budgetItems,[category]:rows}
 return {budgetItems,[category]:String(budgetSubtotal(rows)),...Object.fromEntries([1,2,3].flatMap(n=>[[category+'Item'+n,rows[n-1]?.description??''],[category+'Amount'+n,rows[n-1]?.amount??'']]))}
}
export function invalidBudgetAmount(value){return value!==''&&value!==undefined&&(!['number','string'].includes(typeof value)||!Number.isFinite(Number(value))||Number(value)<0)}
