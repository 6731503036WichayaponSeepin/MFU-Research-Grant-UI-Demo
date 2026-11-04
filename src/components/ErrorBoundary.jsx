import { Component } from 'react'
export default class ErrorBoundary extends Component {
  state = { failed:false }
  static getDerivedStateFromError() { return {failed:true} }
  render() {
    if (this.state.failed) return <section className="card" role="alert"><h1>ไม่สามารถแสดงข้อมูล / Unable to display data</h1><p>โปรดตรวจสอบพื้นที่จัดเก็บแล้วลองใหม่ ข้อมูลที่บันทึกไว้ไม่ได้ถูกลบ / Check browser storage and retry. Saved records have not been deleted.</p><button onClick={()=>window.location.reload()}>โหลดใหม่ / Reload</button></section>
    return this.props.children
  }
}
