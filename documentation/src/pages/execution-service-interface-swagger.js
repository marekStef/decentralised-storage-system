import React from 'react';
import Layout from '@theme/Layout';
import SwaggerUIComponent from '../components/swagger/SwaggerUI';

const SwaggerPage = () => (
  <Layout title="Swagger UI" description="Swagger UI Documentation">
    <div style={{ padding: '20px' }}>
      <SwaggerUIComponent />
    </div>
  </Layout>
);

export default SwaggerPage;
