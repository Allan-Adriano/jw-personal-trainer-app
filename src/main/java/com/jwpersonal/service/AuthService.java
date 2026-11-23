package com.jwpersonal.service;

import com.jwpersonal.model.User;
import com.jwpersonal.repository.IUserRepository;

import java.util.Optional;

public class AuthService {

    private final IUserRepository userRepository;

    public AuthService(IUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User login (String email, String senha){

        Optional<User> user = userRepository.buscarPorEmail(email);

        if (user.isEmpty()){
            throw new RuntimeException("Usuário não encontrado");
        }

        if (!user.get().getSenha().equals(senha)){
            throw new RuntimeException("Senha incorreta.");
        }

        if (!user.get().isAtivo()){
            throw new RuntimeException("Usuário inativo");
        }
        return user.get();
    }

    public void cadastrar(User user){

        //verifica se o E-mail já existe
        Optional<User> existente = userRepository.buscarPorEmail(user.getEmail());
        if (existente.isPresent()){
            throw new RuntimeException("O e-mail já esta cadastrado");
        }
        userRepository.salvar(user);
    }

    public void verificarPermissao(User user, String roleNecessario){
        if (!user.getRole().equals(roleNecessario)){
            throw new RuntimeException("Acesso negado. Perfil necessario: " + roleNecessario);
        }
    }
}
