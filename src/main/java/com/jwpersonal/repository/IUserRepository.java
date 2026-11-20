package com.jwpersonal.repository;

import com.jwpersonal.model.User;

import java.util.List;
import java.util.Optional;

public interface IUserRepository {

    void salvar(User user);
    Optional<User> buscarPorEmail(String email);
    Optional<User> buscarPorId(int id);
    List<User> listarAlunos();
    void atualizar(User user);
}
