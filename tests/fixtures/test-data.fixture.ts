/**
 * Test Data Factory
 * 
 * Centralized test data generation for all test scenarios.
 * Use these factories instead of creating test data inline in tests.
 */

/**
 * Generate a unique agent name with timestamp
 * @param prefix - Prefix for the agent name (e.g., 'CreateTest', 'DeleteTest')
 * @returns Unique agent name
 */
export const generateAgentName = (prefix: string = 'TestAgent'): string => {
  return `${prefix}_${Date.now()}`;
};

/**
 * Generate random string for test data
 * @param length - Length of the random string
 * @returns Random alphanumeric string
 */
export const generateRandomString = (length: number = 10): string => {
  return Math.random().toString(36).substring(2, 2 + length);
};

/**
 * Test Agent Data Interface
 */
export interface TestAgent {
  name: string;
  description?: string;
  context?: string;
  tags?: string[];
}

/**
 * Create a basic test agent with required fields
 * @param prefix - Prefix for agent name (default: 'TestAgent')
 * @returns Test agent object
 */
export const createTestAgent = (prefix: string = 'TestAgent'): TestAgent => {
  return {
    name: generateAgentName(prefix),
    description: 'Auto-generated test agent for automation testing',
    context: 'This is a test agent created by automated tests',
  };
};

/**
 * Create a test agent for creation tests
 * @returns Test agent object optimized for creation tests
 */
export const createAgentForCreation = (): TestAgent => {
  const timestamp = Date.now();
  return {
    name: `CreateTest_${timestamp}`,
    description: 'Agent created to test agent creation functionality',
    context: 'Test context for agent creation validation',
  };
};

/**
 * Create a test agent for deletion tests
 * @returns Test agent object optimized for deletion tests
 */
export const createAgentForDeletion = (): TestAgent => {
  const timestamp = Date.now();
  return {
    name: `DeleteTest_${timestamp}`,
    description: 'Agent created for deletion test',
    context: 'This agent will be deleted as part of test case',
  };
};

/**
 * Create a test agent for editing tests
 * @returns Test agent object optimized for edit tests
 */
export const createAgentForEditing = (): TestAgent => {
  const timestamp = Date.now();
  return {
    name: `EditTest_${timestamp}`,
    description: 'Agent created for editing test',
    context: 'Original context that will be updated during test',
  };
};

/**
 * Create a test agent with custom data
 * @param overrides - Custom fields to override defaults
 * @returns Test agent object with custom data
 */
export const createCustomAgent = (overrides: Partial<TestAgent>): TestAgent => {
  const defaultAgent = createTestAgent();
  return {
    ...defaultAgent,
    ...overrides,
  };
};

/**
 * Create a test agent with minimal data (name only)
 * @param prefix - Prefix for agent name
 * @returns Test agent with only name field
 */
export const createMinimalAgent = (prefix: string = 'MinimalTest'): TestAgent => {
  return {
    name: generateAgentName(prefix),
  };
};

/**
 * Create a test agent with maximum fields populated
 * @returns Test agent with all possible fields
 */
export const createMaximalAgent = (): TestAgent => {
  const timestamp = Date.now();
  return {
    name: `MaximalTest_${timestamp}`,
    description: `Comprehensive test agent created at ${new Date().toISOString()}`,
    context: `Detailed context with multiple lines.\nThis agent has extensive configuration.\nUsed for comprehensive testing scenarios.`,
    tags: ['test', 'automation', 'comprehensive'],
  };
};

/**
 * Generate updated context for edit tests
 * @param prefix - Prefix for context (default: 'Updated Test Context')
 * @returns Updated context string with unique identifier
 */
export const generateUpdatedContext = (prefix: string = 'Updated Test Context'): string => {
  return `${prefix} - ${generateRandomString(15)}`;
};

/**
 * Test data constants for known agents
 */
export const KNOWN_AGENTS = {
  /** Existing agent used for edit tests */
  EDIT_TARGET: 'kpi_aqa_agent',
  
  /** Existing agent for read-only tests */
  READ_ONLY: 'Assessment analyst',
} as const;

/**
 * Test data for validation scenarios
 */
export const VALIDATION_DATA = {
  /** Empty name (should fail validation) */
  EMPTY_NAME: '',
  
  /** Very long name (may fail validation) */
  LONG_NAME: 'A'.repeat(256),
  
  /** Name with special characters */
  SPECIAL_CHARS: 'Test@Agent#$%',
  
  /** Maximum valid description length */
  MAX_DESCRIPTION: 'Test description. '.repeat(50),
} as const;

/**
 * Cleanup helper - tracks created agents for deletion
 */
export class TestDataTracker {
  private createdAgents: string[] = [];

  /**
   * Track a created agent
   * @param agentName - Name of the agent to track
   */
  track(agentName: string): void {
    this.createdAgents.push(agentName);
  }

  /**
   * Get all tracked agent names
   * @returns Array of tracked agent names
   */
  getTracked(): string[] {
    return [...this.createdAgents];
  }

  /**
   * Clear all tracked agents
   */
  clear(): void {
    this.createdAgents = [];
  }

  /**
   * Get count of tracked agents
   * @returns Number of tracked agents
   */
  count(): number {
    return this.createdAgents.length;
  }
}
