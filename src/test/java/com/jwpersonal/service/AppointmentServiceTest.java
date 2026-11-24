package com.jwpersonal.service;

import com.jwpersonal.model.User;
import com.jwpersonal.repository.IUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

public class AppointmentServiceTest {

    private AuthService authService;


    private IUserRepository userRepositoryFake;

    @BeforeEach
    void setUp() {
        userRepositoryFake = new IUserRepository() {

            @Override
            public Optional<User> buscarPorEmail(String email) {
                if (email.equals("aluno@test.com")) {
                    User user = new User("Allan", "aluno@test.com", "123456", "aluno");
                    user.setId(1);
                    return Optional.of(user);
                }
                return Optional.empty();
            }

            @Override
            public void salvar(User user) {}

            @Override
            public Optional<User> buscarPorId(int id) { return Optional.empty(); }

            @Override
            public java.util.List<User> listarAlunos() { return new java.util.ArrayList<>(); }

            @Override
            public void atualizar(User user) {}
        };

        authService = new AuthService(userRepositoryFake);
    }

    @Test
    void deveRetornarUsuarioQuandoLoginCorreto() {
        User user = authService.login("aluno@test.com", "123456");
        assertNotNull(user);
        assertEquals("aluno@test.com", user.getEmail());
    }

    @Test
    void deveRetornarErroQuandoSenhaIncorreta() {
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login("aluno@test.com", "senhaerrada");
        });
        assertEquals("Senha incorreta.", exception.getMessage());
    }

    @Test
    void deveRetornarErroQuandoUsuarioNaoEncontrado() {
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login("inexistente@test.com", "123456");
        });
        assertEquals("Usuário não encontrado.", exception.getMessage());
    }

    @Test
    void deveImpedirCadastroComEmailDuplicado() {
        User novoUser = new User("Dyego", "aluno@test.com", "654321", "aluno");
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.cadastrar(novoUser);
        });
        assertEquals("Email já cadastrado.", exception.getMessage());
    }

    @Test
    void deveNegarAcessoQuandoPerfilIncorreto() {
        User aluno = new User("Allan", "aluno@test.com", "123456", "aluno");
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.verificarPermissao(aluno, "personal");
        });
        assertTrue(exception.getMessage().contains("Acesso negado"));
    }
}
