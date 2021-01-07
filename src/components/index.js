import styled from "styled-components"

export const Header = styled.header`
  background-color: #282c34;
  min-height: 8vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: white;
  width: 100vw;
`;

export const WrongNetHeader = styled.header`
  background-color: #F35454;
  min-height: 8vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  width: 100vw;
`;

export const Title = styled.div`
  text-align: center;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
`

export const Splash = styled.div`
  align-items: center;
  background-color: #282c34;
  color: white;
  min-height: 92vh;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  padding-top: 7rem;
`;

export const Container = styled.div`
  align-items: center;
  background-color: #282c34;
  color: white;
  min-height: 92vh;
  font-size: 1.2rem;
  width: 100vw;
  padding-top: 7rem;
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