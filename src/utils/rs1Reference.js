// Compatibility exports derived exclusively from the exact document catalogue.
import {rs1Document} from '../data/rs1Document.js'
export const rs1Instructions=Object.fromEntries(rs1Document.filter(b=>b.instruction).map(b=>[b.id.replace(/^a/,''),[b.instruction.th,b.instruction.en]]))
export const originalOptions=Object.fromEntries(rs1Document.filter(b=>b.type==='choices').map(b=>[({strategy:'strategy',outcomeType:'outcome',publicationLevel:'publication',standards:'standards'})[b.key],b.options.map(o=>o.en)]))
