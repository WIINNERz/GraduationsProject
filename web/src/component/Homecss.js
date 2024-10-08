import styled from 'styled-components';

export const Screen = styled.div`
  height: 100%;
  margin: 0;
  padding: 0;
`;
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
export const Header = styled.header`
  background-color: #777;
  padding: 20px;
  text-align: center;
  box-sizing: border-box;
`;
export const Section = styled.section`
  display: flex;
  flex: 1;
  overflow: hidden;
`;
export const Nav = styled.nav`
  flex: 1;
  background: #ccc;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  @media (max-width: 600px) {
    padding: 10px;
    flex: 1 100%;
    height: auto;
  }
`;
export const Navul = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;
export const Article = styled.article`
  flex: 3;
  background-color: #f1f1f1;
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;
  @media (max-width: 600px) {
    padding: 10px;
    flex: 1 100%;
    height: auto;
  }
`;
export const Footer = styled.footer`
  background-color: #777;
  padding: 20px;
  text-align: center;
  box-sizing: border-box;
`;
