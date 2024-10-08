import React from 'react';
import {useNavigate} from 'react-router-dom';
import * as Components from '../component/Homecss';
const Home = () => {
  const navigate = useNavigate();
  const handlelogout = () => {
    navigate('/');
  };
  return (

    <Components.Screen>
      <Components.Container>
        <Components.Header>
          <h2>PetPaw for Vet</h2>
        </Components.Header>
        <Components.Section>
          <Components.Nav>
            <Components.Navul>
              <li>
                <h2>table of content</h2>
              </li>
              <li>
                <button onClick={handlelogout}>Logout</button>
              </li>
              <li>
                <button onClick={() => navigate('/user-form')}> form</button>
              </li>
            </Components.Navul>
          </Components.Nav>
          <Components.Article>
            <h1>Welcome to the Home Page</h1>
            <p>
              London is the capital city of England. It is the most populous
              city in the United Kingdom, with a metropolitan area of over 13
              million inhabitants.
            </p>
            <p>
              Standing on the River Thames, London has been a major settlement
              for two millennia, its history going back to its founding by the
              Romans, who named it Londinium. Lorem Ipsum is simply dummy text of
              the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s, when an
              unknown printer took a galley of type and scrambled it to make a
              type specimen book. It has survived not only five centuries, but
              also the leap into electronic typesetting, remaining essentially
              unchanged. It was popularised in the 1960s with the release of
              Letraset sheets containing Lorem Ipsum passages, and more recently
              with desktop publishing software like Aldus PageMaker including
              versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the
              printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s, when an
              unknown printer took a galley of type and scrambled it to make a
              type specimen book. It has survived not only five centuries, but
              also the leap into electronic typesetting, remaining essentially
              unchanged. It was popularised in the 1960s with the release of
              Letraset sheets containing Lorem Ipsum passages, and more recently
              with desktop publishing software like Aldus PageMaker including
              versions of Lorem Ipsum.
            </p>
          </Components.Article>
        </Components.Section>
        <Components.Footer>
          <p>Powered by We have only Seaweed(™)</p>
        </Components.Footer>
      </Components.Container>
    </Components.Screen>
  );
};

export default Home;
