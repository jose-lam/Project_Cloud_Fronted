import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container">
      <div className="state-msg">
        <h3>Página no encontrada</h3>
        <p>La página que buscas no existe o fue movida.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
