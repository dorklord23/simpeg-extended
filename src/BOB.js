import React from 'react'
const data = [
  {
    'title': 'xyz',
    'id': '1'
  },
  {
    'title': 'abc',
    'id': '2'
  },
  {
    'title': '123',
    'id': '3'
  },
]

export default class BOB2 extends React.Component {
  render() {
    const adjust_data = elements => elements.map(el => <li key={el.title}>{el.id}</li>)
      return (
        <ul>
          {adjust_data(data)}
        </ul>
      )
  }
}
