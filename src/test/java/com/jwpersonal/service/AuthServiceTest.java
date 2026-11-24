package com.jwpersonal.service;

import com.jwpersonal.model.Appointment;
import com.jwpersonal.model.AppointmentStatus;
import com.jwpersonal.model.User;
import com.jwpersonal.repository.IAppointmentRepository;
import com.jwpersonal.strategy.CancelamentoSimples;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class AuthServiceTest {

    private AppointmentService appointmentService;
    private Map<Integer, Appointment> banco;

    @BeforeEach
    void setUp() {
        banco = new HashMap<>();

        IAppointmentRepository repositoryFake = new IAppointmentRepository() {

            @Override
            public void salvar(Appointment a) {
                a.setId(banco.size() + 1);
                banco.put(a.getId(), a);
            }

            @Override
            public Optional<Appointment> buscarPorId(int id) {
                return Optional.ofNullable(banco.get(id));
            }

            @Override
            public List<Appointment> listarPorAluno(int alunoId) { return new ArrayList<>(); }

            @Override
            public List<Appointment> listarPorPersonal(int personalId) { return new ArrayList<>(); }

            @Override
            public List<Appointment> listarPorData(int personalId, LocalDate data) { return new ArrayList<>(); }

            @Override
            public boolean existeConflito(int personalId, LocalDate data,
                                          LocalTime horaInicio, LocalTime horaFim) {
                return banco.values().stream().anyMatch(a ->
                        a.getPersonalId() == personalId &&
                                a.getData().equals(data) &&
                                a.getStatus() != AppointmentStatus.CANCELADO &&
                                a.getHoraInicio().isBefore(horaFim) &&
                                a.getHoraFim().isAfter(horaInicio));
            }

            @Override
            public void atualizar(Appointment a) {
                banco.put(a.getId(), a);
            }
        };

        appointmentService = new AppointmentService(repositoryFake, new CancelamentoSimples());
    }

    @Test
    void deveAgendarSessaoComSucesso() {
        User aluno = new User("Allan", "aluno@test.com", "123456", "aluno");
        aluno.setId(1);

        Appointment a = appointmentService.agendar(aluno, 1,
                LocalDate.now().plusDays(1),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0));

        assertNotNull(a);
        assertEquals(AppointmentStatus.AGENDADO, a.getStatus());
    }

    @Test
    void deveImpedirConflitoDeHorarios() {
        User aluno = new User("Allan", "aluno@test.com", "123456", "aluno");
        aluno.setId(1);

        // Primeiro agendamento
        appointmentService.agendar(aluno, 1,
                LocalDate.now().plusDays(1),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0));

        // Segundo agendamento no mesmo horário
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            appointmentService.agendar(aluno, 1,
                    LocalDate.now().plusDays(1),
                    LocalTime.of(10, 30),
                    LocalTime.of(11, 30));
        });

        assertTrue(exception.getMessage().contains("Conflito de horário"));
    }

    @Test
    void deveImpedirConfirmacaoDuplicada() {
        User aluno = new User("Allan", "aluno@test.com", "123456", "aluno");
        aluno.setId(1);
        User personal = new User("Personal", "personal@test.com", "123456", "personal");
        personal.setId(2);

        Appointment a = appointmentService.agendar(aluno, 2,
                LocalDate.now().plusDays(1),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0));

        // Primeira confirmação
        appointmentService.confirmar(a.getId(), personal);

        // Segunda confirmação — deve lançar erro
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            appointmentService.confirmar(a.getId(), personal);
        });

        assertEquals("Agendamento já foi confirmado.", exception.getMessage());
    }

    @Test
    void deveCancelarAgendamentoComSucesso() {
        User aluno = new User("Allan", "aluno@test.com", "123456", "aluno");
        aluno.setId(1);

        Appointment a = appointmentService.agendar(aluno, 1,
                LocalDate.now().plusDays(1),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0));

        appointmentService.cancelar(a.getId(), aluno, "Motivo teste");

        assertEquals(AppointmentStatus.CANCELADO, banco.get(a.getId()).getStatus());
    }

    @Test
    void deveImpedirAlunoDeConfirmarSessao() {
        User aluno = new User("Allan", "aluno@test.com", "123456", "aluno");
        aluno.setId(1);

        Appointment a = appointmentService.agendar(aluno, 1,
                LocalDate.now().plusDays(1),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            appointmentService.confirmar(a.getId(), aluno);
        });

        assertTrue(exception.getMessage().contains("Apenas o personal"));
    }
}
