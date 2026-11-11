package com.jwpersonal.model;


import java.time.LocalDateTime;

public class Session {

    private int id;
    private int appointmentId;
    private SessionStatus status;
    private String notes; // Observação da sessão
    private LocalDateTime completedAt; //Data e hora que a sessão foi concluída.
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    @Override
    public String toString() {
        return "Session{" +
                "id=" + id +
                ", appointmentId=" + appointmentId +
                ", status=" + status + ", registrada = " + registrada + "}";
    }
}
