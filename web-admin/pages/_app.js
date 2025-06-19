import '../styles/globals.css'
import Head from 'next/head'
import { MemberProvider } from '../common/context/MemberContext';
import { Web3Provider } from '../common/context/Web3Context';
import { ToastProvider } from '../common/context/ToastContext';

//import Layout from '../common/components/layout/Layout'
import dynamic from 'next/dynamic'
import Toast from '../common/components/toast';
const Layout = dynamic(() => import('../common/components/layout/Layout'), { ssr: false });

function MyApp({ Component, pageProps }) {

  return (
          <MemberProvider>
            <Head>
              <title>{process.env.TITLE} Admin Portal</title>
              <link rel="icon" href="/favicon.ico" />
            </Head> 
            <Web3Provider>     
              <ToastProvider>
                <Layout>
                  <Component {...pageProps} />
                  <Toast/>
                </Layout>          
              </ToastProvider>                     
            </Web3Provider> 
          </MemberProvider>
          )
        
}

export default MyApp
