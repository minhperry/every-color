import React from "react";
import styled from "styled-components";
import {
  WIDTH_TO_SHOW_DOUBLE_HEIGHT,
  querySmallScreen,
} from "../../../lib/constants";
import { Code, Twitter, Bsky, Help } from "../Icons/Icons";
const SUBHEADS = [
  "In case you forgot one",
  "Scroll till you find a good one",
  "Pick a random one you like",
  "Yours is in here somewhere",
  "Find your favorite",
];

const Wrapper = styled.header`
  padding: 1rem 1rem 16px 24px;
  line-height: 1;
  border-bottom: 1px solid var(--border-color);
  font-family: monospace;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: relative;

  @media ${querySmallScreen} {
    flex-direction: column;
    gap: 1.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
`;

const TitleSubhead = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-direction: column;

  @media ${querySmallScreen} {
    align-items: center;
  }
`;

const Subhead = styled.div`
  font-size: 0.875rem;
  opacity: 0.7;
  transform: translateX(1px);
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0;
`;

const Link = styled.a`
  color: inherit;
  display: inline;
  transition: color 0.1s ease-in-out;

  @media (hover: hover) {
    &:hover {
      color: var(--neutral-500);
    }
  }
`;

const SelfPromotion = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;

  @media ${querySmallScreen} {
    flex-direction: row-reverse;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }
`;

const TitleLink = styled.a`
  text-decoration: none;
  color: inherit;

  @media (hover: hover) {
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SocialLink = styled.a`
  display: inline-flex;
  align-items: center;
  width: 1.5em;
  height: 1.5em;
  color: var(--slate-500);

  transition: color 0.1s ease-in-out;
  @media (hover: hover) {
    &:hover {
      color: var(--slate-700);
    }
  }
`;

const Socials = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  justify-content: flex-end;
  align-items: center;

  @media (max-width: ${WIDTH_TO_SHOW_DOUBLE_HEIGHT}px) {
    transform: translateY(-1px);
  }
`;

const V4Small = styled.sup`
  font-size: 0.75rem;
`;

function Header() {
  const subhead = React.useMemo(() => {
    return SUBHEADS[Math.floor(Math.random() * SUBHEADS.length)];
  }, []);

  return (
    <Wrapper>
      <TitleSubhead>
        <TitleLink href="/">
          <Title>Every Color, with Alpha!</Title>
        </TitleLink>
        <Subhead>{subhead}</Subhead>
      </TitleSubhead>
      <SelfPromotion>
        <Socials>
          <SocialLink href="https://blog.minhperry.de/blog/every-color">
            <Help/>
          </SocialLink>
          <SocialLink href="https://github.com/minhperry/every-color">
            <Code/>
          </SocialLink>
          <SocialLink href="https://twitter.com/minhperryy">
            <Twitter/>
          </SocialLink>
          <SocialLink href="https://bsky.app/profile/minhperry.de">
            <Bsky/>
          </SocialLink>
        </Socials>
        <p>
          Forked by minhperry from <Link href="https://eieio.games">eieio</Link>
        </p>
      </SelfPromotion>
    </Wrapper>
  );
}

export default Header;
