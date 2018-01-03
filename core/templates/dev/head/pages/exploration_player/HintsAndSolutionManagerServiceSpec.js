// Copyright 2017 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for the Hints/Solution Manager service.
 */

describe('HintsAndSolutionManager service', function() {
  var $timeout;
  var hasms;
  var hof;
  var sof;

  beforeEach(module('oppia'));
  beforeEach(inject(function($injector) {
    $timeout = $injector.get('$timeout');
    hasms = $injector.get('HintsAndSolutionManagerService');
    hof = $injector.get('HintObjectFactory');
    sof = $injector.get('SolutionObjectFactory');

    // Initialize the service with two hints and a solution.
    hasms.reset([
      hof.createFromBackendDict({
        hint_content: {
          html: 'one',
          audio_translations: {}
        }
      }), hof.createFromBackendDict({
        hint_content: {
          html: 'two',
          audio_translations: {}
        }
      })
    ], sof.createFromBackendDict({
      answer_is_exclusive: false,
      correct_answer: 'This is a correct answer!',
      explanation: {
        html: 'This is the explanation to the answer',
        audio_translations: {}
      }
    }));
  }));

  it('should display hints at the right times', function() {
    expect(hasms.isHintViewable(0)).toBe(false);
    expect(hasms.isHintViewable(1)).toBe(false);
    expect(hasms.isSolutionViewable()).toBe(false);

    $timeout.flush();

    // The first hint becomes viewable.
    expect(hasms.isHintViewable(0)).toBe(true);
    expect(hasms.isHintViewable(1)).toBe(false);
    expect(hasms.isSolutionViewable()).toBe(false);

    // No additional hints become viewable because the first hint has not been
    // consumed yet. So, no timeout is running.
    expect($timeout.flush).toThrow();

    expect(hasms.isHintViewable(0)).toBe(true);
    expect(hasms.isHintViewable(1)).toBe(false);
    expect(hasms.isSolutionViewable()).toBe(false);

    // The first hint is consumed, but a delay is needed for the second hint to
    // be viewable.
    expect(hasms.displayHint(0).getHtml()).toBe('one');
    expect(hasms.isHintViewable(0)).toBe(true);
    expect(hasms.isHintViewable(1)).toBe(false);
    expect(hasms.isSolutionViewable()).toBe(false);

    $timeout.flush();

    // The second hint is now available, but has not been consumed yet.
    expect(hasms.isHintViewable(0)).toBe(true);
    expect(hasms.isHintViewable(1)).toBe(true);
    expect(hasms.isSolutionViewable()).toBe(false);

    // The second hint is consumed, but a delay is needed for the solution to
    // be viewable. Previous hints are still viewable, too.
    expect(hasms.displayHint(1).getHtml()).toBe('two');
    expect(hasms.displayHint(0).getHtml()).toBe('one');
    expect(hasms.isHintViewable(0)).toBe(true);
    expect(hasms.isHintViewable(1)).toBe(true);
    expect(hasms.isSolutionViewable()).toBe(false);

    $timeout.flush();

    // The solution is now viewable.
    expect(hasms.isSolutionViewable()).toBe(true);
  });

  it('should show the correct number of hints', function() {
    expect(hasms.getNumHints()).toBe(2);
  });

  it('should correctly retrieve the solution', function() {
    expect(hasms.getSolution().correctAnswer).toBe(
      'This is a correct answer!');
  });
});
