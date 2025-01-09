import { Link } from 'react-router-dom';

export default function NotFoundScreen() {
  return (
    <div>
      <h1>Screen Not Found</h1>
      <Link to="/">Go to main page</Link>
    </div>
  );
}
