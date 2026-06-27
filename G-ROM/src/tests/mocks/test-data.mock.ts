/**
 * Mock data for testing
 */


// refactor de acordo com o scopo do projeto e inclusção do mock de dados para inscrição
export const mockAppPages = [
  { title: 'Início', url: '/folder/home', icon: 'home' },
  { title: 'Administração', url: '/folder/admin', icon: 'paper-plane' },
  { title: 'Listagem', url: '/folder/listagem', icon: 'heart' },
  { title: 'Envio', url: '/folder/upload', icon: 'archive' },
  { title: 'Entrar', url: '/folder/login', icon: 'trash' },
  { title: 'Configurações', url: '/folder/config', icon: 'warning' },
];

export const mockLabels = [
  'Família', 
  'Amigos', 
  'Notas', 
  'Trabalho', 
  'Viagem', 
  'Lembretes'
];

export const mockUser = {
  id: 1,
  name: 'João Silva',
  email: 'joao@example.com',
  role: 'admin'
};

export const mockApiResponse = {
  success: true,
  data: [],
  message: 'Operação realizada com sucesso'
};

export const mockFormData = {
  name: 'Test Name',
  email: 'test@example.com',
  phone: '(11) 99999-9999'
};

/**
 * Mock functions for testing
 */
export const mockServices = {
  authService: {
    login: jasmine.createSpy('login').and.returnValue(Promise.resolve(mockUser)),
    logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve(true)),
    isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(true)
  },
  
  dataService: {
    getData: jasmine.createSpy('getData').and.returnValue(Promise.resolve(mockApiResponse)),
    postData: jasmine.createSpy('postData').and.returnValue(Promise.resolve(mockApiResponse)),
    updateData: jasmine.createSpy('updateData').and.returnValue(Promise.resolve(mockApiResponse)),
    deleteData: jasmine.createSpy('deleteData').and.returnValue(Promise.resolve(mockApiResponse))
  }
};

/**
 * Test fixtures
 */
export const testFixtures = {
  validEmail: 'test@example.com',
  invalidEmail: 'invalid-email',
  validPhone: '(11) 99999-9999',
  invalidPhone: '123',
  sampleText: 'Lorem ipsum dolor sit amet',
  longText: 'A'.repeat(1000)
};
