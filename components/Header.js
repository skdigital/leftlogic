import Link from 'next/link';
import ActiveLink from './ActiveLink';

const menu = {
  Home: '/',
  About: '/about',
  Training: '/training',
  Contact: 'mailto:info@leftlogic.com',
};

export default ({ heading = false }) => (
  <header>
    <div className="overlay section">
      <div className="inner">
        <Link href="/">
          <a className="logo">
            <img src="/static/img/logo.png" alt="Left Logic" />
          </a>
        </Link>
        <nav>
          <ul>
            {Object.entries(menu).map(([title, href]) => (
              <li key={title}>
                <ActiveLink activeClassName="selected" href={href}>
                  <a>{title}</a>
                </ActiveLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="clearfix" />
        {heading && (
          <div id="heading">
            <h1>{heading}</h1>
          </div>
        )}
      </div>
    </div>
  </header>
);
