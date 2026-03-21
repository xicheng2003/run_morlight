import ActivityList from '@/components/ActivityList';
import Layout from '@/components/Layout';

const HomePage = () => {
  return (
    <Layout>
      <div className="pb-16 pt-24 sm:pt-32">
        <ActivityList />
      </div>
    </Layout>
  );
};

export default HomePage;
