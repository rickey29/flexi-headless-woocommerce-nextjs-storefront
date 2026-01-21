/**
 * Button loading state manager
 * Client-side utility for managing button loading states
 */

/**
 * Manage button loading state with proper cleanup
 *
 * @example
 * const button = document.querySelector('button[type="submit"]');
 * const loadingState = new ButtonLoadingState(button);
 *
 * loadingState.start('Processing...');
 * try {
 *   await submitForm();
 * } finally {
 *   loadingState.stop();
 * }
 */
export class ButtonLoadingState {
  private button: HTMLButtonElement;
  private originalText: string;
  private originalDisabledState: boolean;

  /**
   * Create a new button loading state manager
   *
   * @param button - The button element to manage
   */
  constructor(button: HTMLButtonElement) {
    this.button = button;
    this.originalText = button.textContent || '';
    this.originalDisabledState = button.disabled;
  }

  /**
   * Start loading state
   * Disables button and changes text to loading message
   *
   * @param loadingText - Text to display while loading (default: "Loading...")
   */
  start(loadingText: string = 'Loading...'): void {
    this.button.disabled = true;
    this.button.textContent = loadingText;
  }

  /**
   * Stop loading state
   * Restores original button text and disabled state
   */
  stop(): void {
    this.button.disabled = this.originalDisabledState;
    this.button.textContent = this.originalText;
  }

  /**
   * Update loading text without stopping
   * Useful for multi-step processes
   *
   * @param newText - New loading text to display
   */
  updateText(newText: string): void {
    this.button.textContent = newText;
  }

  /**
   * Check if currently in loading state
   *
   * @returns True if button is disabled and text has changed
   */
  isLoading(): boolean {
    return this.button.disabled && this.button.textContent !== this.originalText;
  }
}

/**
 * Simple function-based loading state management
 * For cases where you don't need a class instance
 *
 * @param button - The button element
 * @param loadingText - Text to display while loading
 * @returns Function to restore original state
 *
 * @example
 * const stopLoading = setButtonLoading(submitButton, 'Processing...');
 * try {
 *   await submitForm();
 * } finally {
 *   stopLoading();
 * }
 */
export function setButtonLoading(
  button: HTMLButtonElement,
  loadingText: string = 'Loading...',
): () => void {
  const originalText = button.textContent || '';
  const originalDisabled = button.disabled;

  button.disabled = true;
  button.textContent = loadingText;

  // Return cleanup function
  return () => {
    button.disabled = originalDisabled;
    button.textContent = originalText;
  };
}
