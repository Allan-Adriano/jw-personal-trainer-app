package com.jwpersonal.strategy;

import com.jwpersonal.model.Appointment;
import com.jwpersonal.model.User;

public interface CancelamentoStrategy {

    void cancelar(Appointment appointment, User usuario, String motivo);
}
