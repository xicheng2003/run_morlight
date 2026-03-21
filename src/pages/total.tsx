import React from 'react';
import ActivityList from '@/components/ActivityList';
import Layout from '@/components/Layout';

const HomePage = () => {
  return (
    <Layout>
      <div className="pt-24 sm:pt-32 pb-16">
        <ActivityList />
      </div>
    </Layout>
  );
};

export default HomePage;
