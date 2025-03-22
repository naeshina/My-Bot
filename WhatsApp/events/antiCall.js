class antiCall {
  constructor(conn, m) {
    this.conn = conn;
    this.m = m;
    this.antiCalls = true;
    if(this.antiCalls) {
      if(this.m.status == 'offer') {
        this.conn.rejectCall(this.m.id, this.m.from)
      }
    }
  }
}
module.exports = antiCall