import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

function Feature({title, description}) {
  return (
    <div style={{flex: 1, padding: '0 1rem'}}>
      <Heading as="h3">{title}</Heading>
      <p>{description}</p>
    </div>
  );
}

const features = [
  {
    title: 'Complete Trade Journal',
    description: 'Log every trade with full details — entry/exit prices, P&L, fees, tags, take-profit levels, and chart screenshots. Filter, sort, and analyze your history.',
  },
  {
    title: 'AI Trading Coach',
    description: 'Jesse AI analyzes your trading journal and chart images using OpenAI to identify patterns, detect behavioral issues, and provide actionable feedback.',
  },
  {
    title: '100% Private & Local',
    description: 'All data stays in your browser\'s IndexedDB. No cloud accounts, no subscriptions. Export full backups anytime. Also available as a desktop app.',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header style={{
      padding: '4rem 0',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle" style={{fontSize: '1.3rem', opacity: 0.85}}>
          {siteConfig.tagline}
        </p>
        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem'}}>
          <Link className="button button--primary button--lg" to="/docs/intro">
            Get Started
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/features/dashboard">
            Explore Features
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Trading Journal with AI Insights"
      description="TradeFlow is a privacy-first trading journal with AI-powered analytics, broker CSV import, mentor mode, and desktop app support.">
      <HomepageHeader />
      <main>
        <section style={{display: 'flex', padding: '2rem 0', maxWidth: '960px', margin: '0 auto'}}>
          {features.map((f, i) => (
            <Feature key={i} {...f} />
          ))}
        </section>
      </main>
    </Layout>
  );
}
