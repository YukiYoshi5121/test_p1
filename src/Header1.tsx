import { Link } from 'react-router-dom'

import './index.css';

// =================== Header1 =====================
function Header1() {
  return (
    <div>
      <Link to={`/test1`}>〇✕</Link>
      <Link to={`/test2`}>五目</Link>
      <Link to={`/test3`}>スネーク</Link>
      <Link to={`/test4`}>オセロ</Link>
      <Link to={`/test5`}>連鎖オセロ</Link>
      <Link to={`/test6`}>連鎖オセロサンプル</Link>
  </div>
  );
}

export default Header1;