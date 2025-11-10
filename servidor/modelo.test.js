const modelo = require("./modelo.js"); 

describe('El sistema', function() {
  let sistema;
  
  beforeEach(function() {
    sistema = new modelo.Sistema()
  });

  it('inicialmente no hay usuarios', function() {
    expect(sistema.numeroUsuarios()).toEqual(0);
  });
  it('agregarUsuario agrega un usuario nuevo', function() {
    sistema.agregarUsuario("Pepe");
    expect(sistema.numeroUsuarios()).toEqual(1);
    expect(sistema.obtenerUsuarios().Pepe.nick).toEqual("Pepe");
  });

  it('obtenerUsuarios devuelve todos los usuarios', function() {
    sistema.agregarUsuario("Pepe");
    sistema.agregarUsuario("Ana");
    const usuarios = sistema.obtenerUsuarios();
    expect(Object.keys(usuarios).length).toEqual(2);
    expect(usuarios.Pepe.nick).toEqual("Pepe");
    expect(usuarios.Ana.nick).toEqual("Ana");
  });

  it('usuarioActivo devuelve true si el usuario existe y false si no', function() {
    sistema.agregarUsuario("Pepe");
    // jasmine de otra version, por eso se modifica el toBe
     expect(sistema.usuarioActivo("Pepe")).toBe(true);
     expect(sistema.usuarioActivo("Ana")).toBe(false);
  });

  it('eliminarUsuario elimina correctamente al usuario', function() {
    sistema.agregarUsuario("Pepe");
    expect(sistema.numeroUsuarios()).toEqual(1);
    sistema.eliminarUsuario("Pepe");
    expect(sistema.numeroUsuarios()).toEqual(0);
    expect(sistema.usuarioActivo("Pepe")).toBe(false);
  });
});
