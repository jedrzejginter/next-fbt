import Document, { Head, Main, NextScript, Html, DocumentContext } from 'next/document';
import { v4 } from 'uuid';

type Props = {
  nonce: string;
};

class NextDocument extends Document<Props> {
  static override async getInitialProps(ctx: DocumentContext) {
    // Get nonce set by our custom middleware (see ./middleware).
    // `ctx.response` is undefined when page is statically pre-rendered.
    const nonce = ctx.res?.getHeader('x-nonce') ?? v4();

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      nonce,
    };
  }

  override render() {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="preconnect"
            href={process.env['API_URL_OR_PATHNAME']}
            nonce={this.props.nonce}
          />
        </Head>
        <body>
          <Main />
          <NextScript nonce={this.props.nonce} />
        </body>
      </Html>
    );
  }
}

export default NextDocument;
