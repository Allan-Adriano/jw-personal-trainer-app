package com.jwpersonal.repository;

import com.jwpersonal.model.Session;
import com.jwpersonal.model.User;
import java.util.List;
import java.util.Optional;

public interface ISessionRepository {

    void salvar(Session session);
    Optional<Session> buscarPorId(int id);
    Optional<Session> buscarPorAgendamento(int appointmentId);
    List<Session> listarPorAluno(int alunoId);
    void atualizar(Session session);

}
