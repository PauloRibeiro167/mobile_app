describe('Login Page E2E Tests', () => {

  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.get('app-login').should('exist');
    cy.get('ion-input[formControlName="email"]').should('be.visible');
    cy.get('ion-input[formControlName="password"]').should('be.visible');
    cy.get('ion-button[type="submit"]').should('be.visible');
  });

  it('should show an error message for empty fields', () => {
    cy.get('ion-button[type="submit"]').click();
    cy.get('ion-toast').should('exist');
    cy.get('ion-toast').should('have.attr', 'color', 'warning');
    cy.get('ion-toast').should('contain.text', 'Por favor, preencha todos os campos');
  });

  it('should show an error message for incorrect credentials', () => {
    cy.get('ion-input[formControlName="email"]').type('wrong@email.com');
    cy.get('ion-input[formControlName="password"]').type('wrongpassword');
    cy.get('ion-button[type="submit"]').click();
    cy.get('ion-toast').should('exist');
    cy.get('ion-toast').should('have.attr', 'color', 'danger');
    cy.get('ion-toast').should('contain.text', 'Email ou senha incorretos');
  });

  it('should login successfully with correct credentials', () => {
    cy.get('ion-input[formControlName="email"]').type('admin@sitfor.com');
    cy.get('ion-input[formControlName="password"]').type('123456');
    cy.get('ion-button[type="submit"]').click();
    cy.get('ion-toast').should('exist');
    cy.get('ion-toast').should('have.attr', 'color', 'success');
    cy.get('ion-toast').should('contain.text', 'Login realizado com sucesso!');
    cy.url().should('include', '/home');
  });

  it('should remember the user when "Lembrar-me" is checked', () => {
    cy.get('ion-input[formControlName="email"]').type('admin@sitfor.com');
    cy.get('ion-checkbox[formControlName="rememberMe"]').check();
    cy.get('ion-button[type="submit"]').click();
    cy.visit('/login');
    cy.get('ion-input[formControlName="email"]').should('have.value', 'admin@sitfor.com');
    cy.get('ion-checkbox[formControlName="rememberMe"]').should('be.checked');
  });

  it('should show the password when the eye icon is clicked', () => {
    cy.get('ion-input[formControlName="password"]').should('have.attr', 'type', 'password');
    cy.get('ion-icon[name="eye-off-outline"]').click();
    cy.get('ion-input[formControlName="password"]').should('have.attr', 'type', 'text');
    cy.get('ion-icon[name="eye-outline"]').click();
    cy.get('ion-input[formControlName="password"]').should('have.attr', 'type', 'password');
  });

  it('should show the forgot password alert', () => {
    cy.contains('Esqueceu a senha?').click();
    cy.get('ion-alert').should('exist');
    cy.get('ion-alert').should('contain.text', 'Recuperar Senha');
  });

  it('should show the register alert', () => {
    cy.contains('Cadastre-se').click();
    cy.get('ion-alert').should('exist');
    cy.get('ion-alert').should('contain.text', 'Cadastro');
  });

  it('should show the Google login alert', () => {
    cy.get('ion-icon[name="logo-google"]').click();
    cy.get('ion-alert').should('exist');
    cy.get('ion-alert').should('contain.text', 'Login com Google');
  });

  it('deve exibir o formulário de login', () => {
    cy.visit('/login');
    cy.get('input[name="username"], input[type="text"]').should('exist');
    cy.get('input[name="password"], input[type="password"]').should('exist');
  });

  it('deve permitir preencher e submeter o formulário de login', () => {
    cy.visit('/login');
    cy.get('input[name="username"], input[type="text"]').type('usuario-teste');
    cy.get('input[name="password"], input[type="password"]').type('senha-teste');
    cy.get('button[type="submit"]').click();
    // Adapte o seletor e a verificação conforme o comportamento esperado após login
  });
});
