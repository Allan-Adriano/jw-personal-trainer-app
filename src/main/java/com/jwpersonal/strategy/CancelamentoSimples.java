package com.jwpersonal.strategy;

import com.jwpersonal.model.Appointment;
import com.jwpersonal.model.AppointmentStatus;
import com.jwpersonal.model.User;

public class CancelamentoSimples implements CancelamentoStrategy{

    @Override
    public void cancelar(Appointment appointment, User usuario, String motivo) {
        appointment.setStatus(AppointmentStatus.CANCELADO);
        appointment.setObservacao("Cancelado por :" + usuario.getNome() + ": " + motivo);
    }
}
