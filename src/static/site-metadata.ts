interface ISiteMetadataResult {
  siteTitle: string;
  siteUrl: string;
  description: string;
  logo: string;
  navLinks: {
    name: string;
    url: string;
  }[];
}

const getBasePath = () => {
  const baseUrl = import.meta.env.BASE_URL;
  return baseUrl === '/' ? '' : baseUrl;
};

const data: ISiteMetadataResult = {
  siteTitle: 'Running Page',
  siteUrl: 'https://run.morlight.top',
  logo: 'https://www.morlight.top/_next/image?url=https%3A%2F%2Fwww.notion.so%2Fimage%2Fhttps%253A%252F%252Fs3-us-west-2.amazonaws.com%252Fsecure.notion-static.com%252Fcdd6f98e-1b29-48cc-a945-6c40a5af5cd2%252FFC4FBDCC-EF7E-46BA-8DA2-070425A9CFF2.jpeg%3Ftable%3Dblock%26id%3D512c9d3b-2e49-4726-994d-beb12913e850%26cache%3Dv2&w=1920&q=75',
  description: 'Personal site and blog',
  navLinks: [
    {
      name: 'Summary',
      url: `${getBasePath()}/summary`,
    },
    {
      name: 'About',
      url: 'https://www.morlight.top/a0046fa778e640728f429504fa632637',
    },
    {
      name: 'Journal',
      url: 'https://www.morlight.top/6726a7bca83d4997b15ff5c6846fcad9',
    },
  ],
};

export default data;
