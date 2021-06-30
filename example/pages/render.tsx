import { CodeBlockRenderer } from '@hexx/block-code';
import { BlockType, createHexxMarkdownParser } from '@hexx/editor';
import { EditorRenderer, PresetScope } from '@hexx/renderer';
import { styled } from '@hexx/theme';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import { editorStyles } from 'lib/common-style';
import { mdastConfigs } from 'lib/edit-scope';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import path from 'path';
import styles from '../styles/Home.module.css';

const renderScope = {
  ...PresetScope,
  code: CodeBlockRenderer,
};

const Header = styled('header', {
  width: '100%',
  paddingLeft: 50,
  height: 56,
  fontSize: 26,
});

const Logo = styled('a', {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  color: 'black',
});

const SVG = (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.311zM12 16a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z"
      fill="#000"
    />
  </svg>
);

export default function Home(props: { json?: BlockType<any>[] }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Hexx Editor</title>
      </Head>
      <Header>
        <Logo href="https://github.com/ericyip/hexx">
          {SVG}
          <span style={{ marginLeft: '6px', fontSize: 20 }}>
            Hexx
          </span>
        </Logo>
      </Header>
      <main className={styles.main}>
        <EditorRenderer
          wrapper={{
            css: editorStyles.css,
          }}
          blockWrapper={{
            css: editorStyles.blockCss,
          }}
          blocks={props.json}
          scope={renderScope}
        />
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const markdownParser = createHexxMarkdownParser(mdastConfigs, {
    // to support ssr or ssg you have to use jsdom in markdown parser
    document: new JSDOM().window.document,
    autoGenerateId: true,
  });
  const readmeDir = path.join(process.cwd(), '../README.md');
  const markdown = fs.readFileSync(readmeDir, 'utf8');
  const json = markdownParser.toData(markdown);
  return {
    props: {
      markdown,
      json,
    },
  };
};
