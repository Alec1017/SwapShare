import styled from "styled-components"

export const Header = styled.header`
  background-color: #282c34;
  min-height: 10vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  color: white;
`;

export const Splash = styled.div`
  align-items: center;
  background-color: #282c34;
  color: white;
  min-height: 90vh;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  padding-top: 7rem;
`;

export const Body = styled.div`
  align-items: center;
  background-color: #282c34;
  color: white;
  min-height: 90vh;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  padding-top: 7rem;
  width: 32%;
`;

export const Image = styled.img`
  height: 40vmin;
  margin-bottom: 16px;
  pointer-events: none;
`;

export const Link = styled.a.attrs({
  target: "_blank",
  rel: "noopener noreferrer",
})`
  color: #61dafb;
  margin-top: 10px;
`;

export const Button = styled.button`
  background-color: white;
  border: none;
  border-radius: 8px;
  color: #282c34;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  margin: 0px 20px;
  padding: 12px 24px;

  ${props => props.hidden && "hidden"} :focus {
    border: none;
    outline: none;
  }
`;