import { flushPromises, mount } from '@vue/test-utils'

import ResetPassword from '@/components/auth/ResetPassword.vue'
import { resetPassword, validatePasswordReset } from '@/stores/user'

vi.mock('@/stores/user', () => ({
  resetPassword: vi.fn(),
  validatePasswordReset: vi.fn(),
}))

vi.mock('@/stores/routes', () => ({
  route: () => '/sensors/',
}))

const info = {
  username: 'jdoe123',
  full_name: 'John Doe',
  email: 'jdoe@example.com',
}

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.replaceState({}, '', '/reset-password?token=test-token')
  })

  test('renders the form for a valid link', async () => {
    vi.mocked(validatePasswordReset).mockResolvedValue(info)

    const wrapper = mount(ResetPassword)
    await flushPromises()

    expect(validatePasswordReset).toHaveBeenCalledWith('test-token')

    const inputs = wrapper.findAll('input')
    expect(inputs).toHaveLength(3)
    expect(inputs[0].element.value).toBe(info.username)
    expect(inputs[0].attributes('readonly')).toBeDefined()
    expect(wrapper.find('form').exists()).toBe(true)
  })

  test('shows an error for a missing token', async () => {
    window.history.replaceState({}, '', '/reset-password')

    const wrapper = mount(ResetPassword)
    await flushPromises()

    expect(validatePasswordReset).not.toHaveBeenCalled()
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain('missing a token')
  })

  test('shows an error for an invalid or expired link', async () => {
    vi.mocked(validatePasswordReset).mockRejectedValue(new Error('invalid'))

    const wrapper = mount(ResetPassword)
    await flushPromises()

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain('invalid or has expired')
  })

  test('does not submit mismatched passwords', async () => {
    vi.mocked(validatePasswordReset).mockResolvedValue(info)

    const wrapper = mount(ResetPassword)
    await flushPromises()

    const password = wrapper.find('input[name="password"]')
    const confirmPassword = wrapper.find('input[name="confirm_password"]')
    await password.setValue('longpass')
    await confirmPassword.setValue('otherpass')
    await wrapper.find('form').trigger('submit')

    await vi.waitFor(() => expect(wrapper.text()).toContain("Passwords don't match"))
    expect(resetPassword).not.toHaveBeenCalled()
  })
})
