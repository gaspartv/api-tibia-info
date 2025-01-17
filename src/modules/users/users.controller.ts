import { Body, Controller, Param } from "@nestjs/common";
import { UsersCreateDto } from "./dtos/users.create.dto";
import { UsersResponseDto } from "./dtos/users.dto";
import { UsersCreateUseCase } from "./use-case/users.create.use-case";
import { UsersCreateDecorator } from "../../common/decorators/users/users.create.decorator";
import { CurrentUserRequest } from "../../common/requests/current-user.request";
import { UsersSignInDto } from "../../common/dtos/users.sign-in.dto";
import { UsersProfileUseCase } from "./use-case/users.profile.use-case";
import { UsersProfileDecorator } from "../../common/decorators/users/users.profile.decorator";
import { MessageDto } from "../../common/dtos/message.dto";
import { UsersUpdateDto } from "./dtos/users.update.dto";
import { UsersUpdateUseCase } from "./use-case/users.update.use-case";
import { UsersUpdateDecorator } from "../../common/decorators/users/users.update.decorator";
import { UsersChangeEmailDto } from "./dtos/users.change-email.dto";
import { UsersChangeEmailUseCase } from "./use-case/users.change-email.use-case";
import { UsersConfirmChangeEmailUseCase } from "./use-case/users.confirm-change-email.use-case";
import { env } from "../../configs/env";
import { UsersChangeEmailSelfDecorator } from "../../common/decorators/users/users.change-email-self.decorator";
import { UsersChangeEmailSelfConfirmDecorator } from "../../common/decorators/users/users.change-email-self-confirm.decorator";
import { UsersForgotPasswordDto } from "./dtos/users.forgot-password";
import { UsersForgotPasswordUseCase } from "./use-case/users.forgot-password";
import { UsersForgotPasswordDecorator } from "../../common/decorators/users/users-forgot-password.decorator";
import { UsersChangePasswordDecorator } from "../../common/decorators/users/users.change-password.decorator";
import { UsersChangePasswordDto } from "./dtos/users.change-password.dto";
import { UsersChangePasswordUseCase } from "./use-case/users.change-password.use-case";
import { Security } from "../../utils/security.util";

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersCreateUseCase: UsersCreateUseCase,
    private readonly usersProfileUseCase: UsersProfileUseCase,
    private readonly usersUpdateUseCase: UsersUpdateUseCase,
    private readonly usersChangeEmailUseCase: UsersChangeEmailUseCase,
    private readonly usersConfirmChangeEmailUseCase: UsersConfirmChangeEmailUseCase,
    private readonly usersForgotPasswordUseCase: UsersForgotPasswordUseCase,
    private readonly usersChangePasswordUseCase: UsersChangePasswordUseCase,
  ) {}

  @UsersCreateDecorator("create")
  create(@Body() body: UsersCreateDto): Promise<MessageDto> {
    return this.usersCreateUseCase.execute(body);
  }

  @UsersProfileDecorator("profile")
  profile(
    @CurrentUserRequest() userSignIn: UsersSignInDto,
  ): Promise<UsersResponseDto> {
    return this.usersProfileUseCase.execute(userSignIn.id);
  }

  @UsersUpdateDecorator("self/update")
  updateSelf(
    @Body() body: UsersUpdateDto,
    @CurrentUserRequest() user: UsersSignInDto,
  ): Promise<UsersResponseDto> {
    return this.usersUpdateUseCase.execute(body, user.id);
  }

  @UsersChangeEmailSelfDecorator("change-email-self")
  changeEmailSelf(
    @Body() body: UsersChangeEmailDto,
    @CurrentUserRequest() user: UsersSignInDto,
  ): Promise<MessageDto> {
    return this.usersChangeEmailUseCase.execute(body.newEmail, user.id);
  }

  @UsersChangeEmailSelfConfirmDecorator("change-email-self-confirm/:userId")
  async confirmChangeEmailSelf(
    @Param("userId") userId: string,
  ): Promise<{ url: string }> {
    try {
      await this.usersConfirmChangeEmailUseCase.execute(userId);

      return { url: env.URL_FRONT };
    } catch (err) {
      console.log(err.response.message);
      const message = Security.encrypt(err.response.message);
      return { url: env.URL_FRONT + "/error?message=" + message };
    }
  }

  @UsersForgotPasswordDecorator("forgot-password")
  async forgotPassword(
    @Body() body: UsersForgotPasswordDto,
  ): Promise<MessageDto> {
    return await this.usersForgotPasswordUseCase.execute(body.email);
  }

  @UsersChangePasswordDecorator("change-password")
  async changePassword(
    @Body() body: UsersChangePasswordDto,
  ): Promise<MessageDto> {
    return await this.usersChangePasswordUseCase.execute(
      body.userId,
      body.password,
    );
  }
}
