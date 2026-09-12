export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div>
          <p className="site-footer-brand">Qhapaq</p>
          <p className="site-footer-tag">Proyecto académico de Cloud Computing — arquitectura de microservicios.</p>
        </div>
        <div className="site-footer-col">
          <p className="site-footer-heading">Catálogo</p>
          <span>Categorías, productos e inventario vienen del MS1.</span>
        </div>
        <div className="site-footer-col">
          <p className="site-footer-heading">Compras</p>
          <span>El carrito se sincroniza en tiempo real con el MS3 (MongoDB).</span>
        </div>
        <div className="site-footer-col">
          <p className="site-footer-heading">Analítica</p>
          <span>Consultas en vivo contra AWS Athena a través del MS5.</span>
        </div>
      </div>
      <div className="container">
        <p className="site-footer-fine">© {new Date().getFullYear()} Qhapaq. Proyecto sin fines comerciales.</p>
      </div>
    </footer>
  );
}
