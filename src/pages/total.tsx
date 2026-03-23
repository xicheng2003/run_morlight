import { Suspense, lazy } from 'react';
import Layout from '@/components/Layout';

const ActivityList = lazy(() => import('@/components/ActivityList'));

const HomePage = () => {
  return (
    <Layout>
      <div className="pb-16 pt-24 sm:pt-32">
        <Suspense
          fallback={
            <div className="mx-auto w-full max-w-7xl px-6">
              <div className="section-shell">
                <div className="section-shell__header">
                  <span className="section-shell__eyebrow">Loading</span>
                  <h1 className="section-shell__title">Preparing summary workspace</h1>
                </div>
                <p className="text-base leading-7 text-white/58">
                  汇总页面正在按需加载，完成后会自动显示。
                </p>
              </div>
            </div>
          }
        >
          <ActivityList />
        </Suspense>
      </div>
    </Layout>
  );
};

export default HomePage;
