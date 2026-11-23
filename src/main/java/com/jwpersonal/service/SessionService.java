package com.jwpersonal.service;

import com.jwpersonal.model.*;
import com.jwpersonal.repository.IAppointmentRepository;
import com.jwpersonal.repository.ISessionRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public class SessionService {
    private final ISessionRepository sessionRepository;
    private final IAppointmentRepository appointmentRepository;

    public SessionService(ISessionRepository sessionRepository,
                          IAppointmentRepository appointmentRepository) {
        this.sessionRepository = sessionRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // RN06 — Registrar sessão como realizada
    public Session registrarRealizada(int appointmentId, User personal, String observacoes) {

        if (!personal.getRole().equals("personal")) {
            throw new RuntimeException("Apenas o personal pode registrar sessões.");
        }

        Appointment appointment = buscarAppointmentOuErro(appointmentId);

        // Verifica se já existe sessão registrada — evita duplicação
        Optional<Session> sessaoExistente = sessionRepository.buscarPorAgendamento(appointmentId);
        if (sessaoExistente.isPresent() && sessaoExistente.get().isRegistrada()) {
            throw new RuntimeException("Sessão já foi registrada anteriormente.");
        }

        Session session = new Session(appointmentId);
        session.setStatus(SessionStatus.REALIZADA);
        session.setObservacoes(observacoes);
        session.setConcluidoEm(LocalDateTime.now());
        session.setRegistrada(true);

        // Atualiza o status do agendamento
        appointment.setStatus(AppointmentStatus.REALIZADO);
        appointmentRepository.atualizar(appointment);

        sessionRepository.salvar(session);
        return session;
    }

    // RN07 — Registrar ausência do aluno
    public Session registrarAusencia(int appointmentId, User personal) {

        if (!personal.getRole().equals("personal")) {
            throw new RuntimeException("Apenas o personal pode registrar ausência.");
        }

        Appointment appointment = buscarAppointmentOuErro(appointmentId);

        Optional<Session> sessaoExistente = sessionRepository.buscarPorAgendamento(appointmentId);
        if (sessaoExistente.isPresent() && sessaoExistente.get().isRegistrada()) {
            throw new RuntimeException("Sessão já foi registrada anteriormente.");
        }

        Session session = new Session(appointmentId);
        session.setStatus(SessionStatus.AUSENCIA);
        session.setRegistrada(true);

        appointment.setStatus(AppointmentStatus.AUSENCIA);
        appointmentRepository.atualizar(appointment);

        sessionRepository.salvar(session);
        return session;
    }

    public List<Session> listarPorAluno(int alunoId) {
        return sessionRepository.listarPorAluno(alunoId);
    }

    private Appointment buscarAppointmentOuErro(int appointmentId) {
        Optional<Appointment> appointment = appointmentRepository.buscarPorId(appointmentId);
        if (appointment.isEmpty()) {
            throw new RuntimeException("Agendamento não encontrado.");
        }
        return appointment.get();
    }
}
