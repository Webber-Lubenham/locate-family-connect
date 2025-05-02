import React from 'react';

function ExampleComponent() {
  return <div>Componente de Exemplo</div>;
}

describe('ExampleComponent', () => {
  it('renderiza corretamente', () => {
    cy.mount(<ExampleComponent />);
    cy.contains('Componente de Exemplo');
  });
}); 