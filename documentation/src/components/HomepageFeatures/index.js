import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Thorough documentation',
    Image: require('@site/static/img/thorough_documentation.png').default,
    imageType: 'png',
    description: (
      <>
        Thorough documentation of every part of a decentralized storage system, guiding you from the very beginning with a tutorial-like approach.
      </>
    ),
  },
  {
    title: 'Proper examples',
    Image: require('@site/static/img/backend-architecture/architecture.svg').default,
    imageType: 'svg',
    description: (
      <>
        Showing proper examples along the way.
      </>
    ),
  },
  {
    title: 'Multiple Example Apps',
    Image: require('@site/static/img/example_applications.png').default,
    imageType: 'png',
    description: (
      <>
        We have provided you with multiple apps highlighting the unique features of the system.
      </>
    ),
  },
];

function Feature({ Image, imageType, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {imageType === 'png' ? (
          <img src={Image} alt={title} className={clsx(styles.featureSvg, styles.responsiveImage)} />
        ) : (
          <Image className={styles.featureSvg} role="img" />
        )}
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
