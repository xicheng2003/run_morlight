import PropTypes from 'prop-types';
import { PropsWithChildren } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import useSiteMetadata from '@/hooks/useSiteMetadata';

const Layout = ({ children }: PropsWithChildren) => {
  const { siteTitle, description } = useSiteMetadata();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand/30">
      <Helmet bodyAttributes={{ class: 'bg-[#0a0a0a]' }}>
        <html lang="en" className="dark" />
        <title>{siteTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="running" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
      </Helmet>
      <Header />
      <main className="relative isolate overflow-hidden">
        {children}
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
