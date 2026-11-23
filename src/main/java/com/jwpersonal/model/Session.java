package com.jwpersonal.model;


import java.time.LocalDateTime;

public class Session {

    private int id;
    private int appointmentId;
    private SessionStatus status;
    private String observacoes; // Observação da sessão
    private LocalDateTime concluidoEm; //Data e hora que a sessão foi concluída.
    private boolean registrada;

    public Session(){}

    public Session(int appointmentId) {
        this.appointmentId = appointmentId;
        this.status = SessionStatus.PENDENTE;
        this.registrada = false;
    }

    public int getId() {
        return id;
    }

    public boolean isRegistrada() {
        return registrada;
    }

    public void setRegistrada(boolean registrada) {
        this.registrada = registrada;
    }

    public void setId(int id) {
        this.id = id;


    }

    public int getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(int appointmentId) {
        this.appointmentId = appointmentId;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public LocalDateTime getConcluidoEm() {
        return concluidoEm;
    }

    public void setConcluidoEm(LocalDateTime concluidoEm) {
        this.concluidoEm = concluidoEm;
    }

    @Override
    public String toString() {
        return "Session{" +
                "id=" + id +
                ", appointmentId=" + appointmentId +
                ", status=" + status + ", registrada = " + registrada + "}";
    }
}
